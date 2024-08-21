package controller

import "github.com/labstack/echo/v4"

func M(message string) map[string]any {
	return map[string]any{
		"message": message,
	}
}

func BindAndValidate(ctx echo.Context, req interface{}) error {
	if err := ctx.Bind(req); err != nil {
		return err
	}
	if err := ctx.Validate(req); err != nil {
		return err
	}
	return nil
}
