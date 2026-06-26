#!/usr/bin/env python3
"""Apply FIX_SIGNUP.sql using a Postgres connection string.

Get your connection string from:
Supabase Dashboard → Project Settings → Database → Connection string (URI)

Usage:
  DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@..." python scripts/apply_fix_signup.py
"""
import os
import sys

try:
    import psycopg2
except ImportError:
    print("Install psycopg2-binary: pip install psycopg2-binary")
    sys.exit(1)

SQL = "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;"

def main():
    url = os.environ.get("DATABASE_URL")
    if not url:
        print(__doc__)
        sys.exit(1)
    conn = psycopg2.connect(url)
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute(SQL)
    print("OK: signup trigger removed. Signup should work now.")
    conn.close()

if __name__ == "__main__":
    main()