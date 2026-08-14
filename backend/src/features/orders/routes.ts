import { Hono } from "hono";

import type { AuthService } from "../auth/services/auth.service.js";
import { createRequireAuth } from "../../global/middlewares/auth.js";
import type { AppEnv } from "../../types/appEnv.js";
import { createOrderController } from "./controllers/createOrder.controller.js";
import { deleteOrderController } from "./controllers/deleteOrder.controller.js";
import { getOrderController } from "./controllers/getOrder.controller.js";
import { listOrdersController } from "./controllers/listOrders.controller.js";
import { updateOrderController } from "./controllers/updateOrder.controller.js";
import { createValidateOrderOwnership } from "./middlewares/validateOrderOwnership.js";
import type { OrderService } from "./services/order.service.js";

export function createOrderRoutes(deps: { authService: AuthService; orderService: OrderService }) {
  const router = new Hono<AppEnv>();
  const requireAuth = createRequireAuth(deps.authService);
  const validateOrderOwnership = createValidateOrderOwnership(deps.orderService);

  router.use("*", requireAuth);

  router.post("/", createOrderController(deps.orderService));
  router.get("/", listOrdersController(deps.orderService));
  router.get("/:id", validateOrderOwnership, getOrderController(deps.orderService));
  router.patch("/:id", validateOrderOwnership, updateOrderController(deps.orderService));
  router.delete("/:id", validateOrderOwnership, deleteOrderController(deps.orderService));

  return router;
}
