const mongoose = require("mongoose");
const express = require("express");
const usersController = require("./controllers/usersController");
const methodOverride = require("method-override");
const layouts = require("express-ejs-layouts");
const connectFlash = require("connect-flash");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const expressValidator = require("express-validator");
const passport = require("passport");
const User = require("./models/user");

const app = express();
const router = express.Router();

mongoose.connect("mongodb://localhost:27017/recipe_db");
const db = mongoose.connection;
db.once("open", () => {
  console.log("Successfully connected to mongodb!");
});

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(layouts);
app.use(express.json());
app.use(express.urlencoded());
app.set("port", process.env.PORT || 3030);
router.use(expressValidator());
router.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);
router.use(cookieParser("secret-pascode"));
router.use(
  expressSession({
    secret: "secret_passcode",
    cookie: {
      maxAge: 40000,
    },
    resave: false,
    saveUninitialized: false,
  })
);
router.use(connectFlash());
router.use(passport.initialize());
router.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

app.use("/", router);
app.get("/", (req, res) => {
  res.render("index.ejs");
});
router.get("/users", usersController.index, usersController.indexView);
router.get("/users/new", usersController.new);
router.post(
  "/users/create",
  usersController.validate,
  usersController.create,
  usersController.thanks
);
router.get("/users/login", usersController.login);
router.post(
  "/users/login",
  usersController.authenticate,
  usersController.redirectView
);
router.get(
  "/users/logout",
  usersController.logout,
  usersController.redirectView
);
router.get("/users/:id", usersController.show, usersController.showView);
router.get("/users/:id/edit", usersController.edit);
router.put(
  "/users/:id/update",
  usersController.update,
  usersController.redirectView
);
router.delete(
  "/users/:id/delete",
  usersController.delete,
  usersController.redirectView
);
router.get("/users/:id/label", usersController.manage);
router.post(
  "/users/:id/labels",
  usersController.createLabel,
  usersController.redirectView
);
router.put(
  "/users/:id/labels/:index",
  usersController.editLabel,
  usersController.redirectView
);
router.delete(
  "/users/:id/labels/:index",
  usersController.deleteLabel,
  usersController.redirectView
);

app.listen(app.get("port"), () => {
  console.log(`Server is running at http://localhost:${app.get("port")}`);
});
