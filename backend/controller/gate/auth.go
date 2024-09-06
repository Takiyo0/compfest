package gate

import (
	"encoding/base64"
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/service"
)

func Auth(userService *service.UserService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			sseToken := ctx.QueryParam("_sseToken")
			if sseToken != "" {
				// decode token using base64
				base64DecodedToken, err := base64.StdEncoding.DecodeString(sseToken)
				if err != nil {
					return err
				}
				sess, err := userService.GetSessionByToken(string(base64DecodedToken))
				if err != nil {
					return err
				}
				ctx.Set("session", sess)
				return next(ctx)
			}

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
