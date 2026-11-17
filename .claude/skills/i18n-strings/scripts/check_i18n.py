#!/usr/bin/env python3
"""Compara las claves de dos archivos de traducción JSON (es y en).

Uso: python check_i18n.py es.json en.json
Sale con código 1 si hay claves faltantes o valores vacíos.
"""
import json
import sys


def flatten(data, prefix=""):
    keys = {}
    for key, value in data.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys.update(flatten(value, path))
        else:
            keys[path] = value
    return keys


def load(path):
    with open(path, encoding="utf-8") as f:
        return flatten(json.load(f))


def main():
    if len(sys.argv) != 3:
        print("Uso: check_i18n.py es.json en.json")
        return 2
    es, en = load(sys.argv[1]), load(sys.argv[2])
    problems = 0

    for key in sorted(set(es) - set(en)):
        print(f"Falta en {sys.argv[2]}: {key}")
        problems += 1
    for key in sorted(set(en) - set(es)):
        print(f"Falta en {sys.argv[1]}: {key}")
        problems += 1
    for name, table in ((sys.argv[1], es), (sys.argv[2], en)):
        for key, value in sorted(table.items()):
            if isinstance(value, str) and not value.strip():
                print(f"Valor vacío en {name}: {key}")
                problems += 1

    if problems:
        print(f"\n{problems} problema(s) encontrado(s).")
        return 1
    print(f"OK: {len(es)} claves en ambos idiomas.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
