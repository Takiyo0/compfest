package database

import (
	"fmt"
	"github.com/jmoiron/sqlx"
	"strings"
)

func BulkInsert(db *sqlx.DB, table string, columns []string, rows [][]interface{}) error {
	colNames := strings.Join(columns, ", ")
	placeholders := strings.Repeat("?, ", len(columns)-1) + "?"
	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES ", table, colNames)

	var valueStrings []string
	var valueArgs []interface{}

	for range rows {
		valueStrings = append(valueStrings, "("+strings.Repeat(placeholders+", ", len(columns)-1)+placeholders+")")
	}

	query += strings.Join(valueStrings, ", ")

	for _, row := range rows {
		valueArgs = append(valueArgs, row...)
	}

	_, err := db.Exec(query, valueArgs...)
	if err != nil {
		return err
	}

	return nil
}
