
```ts
class HttpTestService {
  
    @GET('user')
    getUser(@Query() query: {[key: string]: string}) {
        const ctx = useContext()
    }
}
```
context