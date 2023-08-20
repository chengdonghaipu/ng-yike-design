package cmd

import "github.com/spf13/cobra"

var rootCommand = &cobra.Command{
	Use:   "nk",
	Short: "Short",
	Long:  "Long",
}

func Execute() error {
	return rootCommand.Execute()
}
