db.createUser(
  {
    user: "cla-user",
    pwd: "cla-pass",
    roles: [
      {
        role: "readWrite",
        db: "cla-db"
      }
    ]
  }
);