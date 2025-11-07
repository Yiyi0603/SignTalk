try:
    import pymysql  # type: ignore
    pymysql.install_as_MySQLdb()
except Exception:
    # PyMySQL not installed yet; Django will error with helpful message.
    pass

