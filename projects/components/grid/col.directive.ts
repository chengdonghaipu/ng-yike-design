/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  Input,
  numberAttribute,
  OnChanges,
  OnInit,
  Signal,
  SimpleChanges
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';

import { HostDom, SafaAny, useHostDom } from 'ng-yk-design/core';

import { NxRowDirective } from './row.directive';

interface UpdateHostStylesReturn {
  readonly rowDirective: NxRowDirective;
  readonly columns: Signal<number>;

  ngOnChanges(changes: SimpleChanges): void;
  updateDepColumnsStyle(column: number, context: SafaAny): void;
}

const inputsMap = {
  nxSpan: {
    update(hostDom: HostDom, value: number, columns: number) {
      value = numberAttribute(value);
      hostDom.setHostStyles({
        maxWidth: `${(value / columns) * 100}%`,
        flex: `0 0 ${(value / columns) * 100}%`
      });
    }
  },
  nxOffset: {
    update(hostDom: HostDom, value: number, columns: number) {
      value = numberAttribute(value);
      hostDom.setHostStyles({
        marginLeft: `${(value / columns) * 100}%`
      });
    }
  },
  nxPull: {
    update(hostDom: HostDom, value: number, columns: number) {
      value = numberAttribute(value);
      hostDom.setHostStyles({
        position: 'relative',
        right: `${(value / columns) * 100}%`
      });
    }
  },
  nxPush: {
    update(hostDom: HostDom, value: number, columns: number) {
      value = numberAttribute(value);
      hostDom.setHostStyles({
        position: 'relative',
        left: `${(value / columns) * 100}%`
      });
    }
  }
};

function useUpdateHostStyles(hostDom: HostDom): Partial<UpdateHostStylesReturn> {
  const rowDirective = inject(NxRowDirective, { optional: true });

  if (!rowDirective) {
    return {};
  }

  const columns = rowDirective.columns;

  function updateDepColumnsStyle(column: number, context: SafaAny): void {
    const filterInputs = ['nxSpan', 'nxOffset', 'nxPull', 'nxPush'];

    Object.entries(inputsMap).forEach(([key, value]) => {
      if (filterInputs.indexOf(key) === -1) {
        return;
      }

      value.update(hostDom, context[key], column);
    });
  }

  toObservable(rowDirective.gutter).subscribe(([mainAxis, crossAxis]) => {
    if (crossAxis === 0) {
      if (!mainAxis) {
        hostDom.removeStyle('paddingLeft');
        hostDom.removeStyle('paddingRight');
        return;
      }

      hostDom.setHostStyle('paddingLeft', `${mainAxis}px`);
      hostDom.setHostStyle('paddingRight', `${mainAxis}px`);
      return;
    }

    hostDom.setHostStyle('padding', `${mainAxis}px ${crossAxis}px`);
  });

  const inputsName = Object.keys(inputsMap);

  function ngOnChanges(changes: SimpleChanges): void {
    Object.keys(changes).forEach(key => {
      if (inputsName.indexOf(key) === -1) {
        return;
      }
      const val = changes[key].currentValue;
      const input = inputsMap[key as keyof typeof inputsMap];
      input.update(hostDom, val, columns());
    });
  }

  return {
    rowDirective,
    ngOnChanges,
    columns: rowDirective.columns,
    updateDepColumnsStyle
  };
}

@Directive()
class ColInputs {
  @Input({ transform: numberAttribute }) nxSpan!: number | string;
  @Input({ transform: numberAttribute }) nxOffset!: number | string;
  @Input({ transform: numberAttribute }) nxPull!: number | string;
  @Input({ transform: numberAttribute }) nxPush!: number | string;
}

@Directive({
  selector: '[nxCol], nx-col',
  standalone: true,
  host: {
    class: 'yk-flex-col'
  }
})
export class NxColDirective extends ColInputs implements OnChanges, OnInit {
  private readonly hostDom = useHostDom();
  private readonly updateHostStyles = useUpdateHostStyles(this.hostDom);
  private readonly columns = computed(() => this.updateHostStyles.columns?.() || 24);
  private readonly columns$ = toObservable(this.columns).pipe(skip(1));

  ngOnChanges(changes: SimpleChanges): void {
    this.updateHostStyles.ngOnChanges?.(changes);
  }

  ngOnInit(): void {
    this.columns$.subscribe(value => this.updateHostStyles.updateDepColumnsStyle?.(value, this));
  }
}
