import { Router } from "express";
import { authRoutes } from "./auth.routes";
import ingredientRoutes from "./ingredient.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/ingredients", ingredientRoutes);

export { routes };