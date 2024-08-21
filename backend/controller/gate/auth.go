package gate

import (
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/service"
)

func Auth(userService *service.UserService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			tokenId, tok, valid := ctx.Request().BasicAuth()
			if !valid {
				return ctx.JSON(401, map[string]string{"message": "Unauthorized"})
			}
			sess, err := userService.GetSessionByToken(tokenId + ":" + tok)
			if err != nil {
				return err
			}
			ctx.Set("session", sess)
			return next(ctx)
		}
	}
}
