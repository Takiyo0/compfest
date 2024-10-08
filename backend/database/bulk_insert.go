package database

import (
	"fmt"
	"github.com/jmoiron/sqlx"
	"strings"
)

func BulkInsert(db *sqlx.DB, table string, columns []string, rows [][]interface{}) error {
	colNames := strings.Join(columns, ", ")
	placeholders := strings.Repeat("?, ", len(columns))[:len(columns)*3-2]
	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES ", table, colNames)

	var valueStrings []string
	var valueArgs []interface{}

	for range rows {
		valueStrings = append(valueStrings, "("+placeholders+")")
	}

	query += strings.Join(valueStrings, ", ")

	for _, row := range rows {
		valueArgs = append(valueArgs, row...)
	}

	fmt.Println(query)

	_, err := db.Exec(query, valueArgs...)
	if err != nil {
		return err
	}

	return nil
}
