package controller

import "github.com/labstack/echo/v4"

type Controller interface {
	SetUp(e *echo.Echo)
}
