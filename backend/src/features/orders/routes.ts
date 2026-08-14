import { Hono } from "hono";

import type { AuthService } from "../auth/services/auth.service.js";
import { listPaymentsController } from "../payments/controllers/listPayments.controller.js";
import { recordPaymentController } from "../payments/controllers/recordPayment.controller.js";
import type { PaymentService } from "../payments/services/payment.service.js";
import { createRequireAuth } from "../../global/middlewares/auth.js";
import { db } from "../../lib/db/index.js";
import type { AppEnv } from "../../types/appEnv.js";
import { createOrderController } from "./controllers/createOrder.controller.js";
import { deleteOrderController } from "./controllers/deleteOrder.controller.js";
import { exportOrdersController } from "./controllers/exportOrders.controller.js";
import { getOrderController } from "./controllers/getOrder.controller.js";
import { listOrdersController } from "./controllers/listOrders.controller.js";
import { listStatusHistoryController } from "./controllers/listStatusHistory.controller.js";
import { updateOrderController } from "./controllers/updateOrder.controller.js";
import { createValidateOrderOwnership } from "./middlewares/validateOrderOwnership.js";
import { createOrderStatusHistoryService } from "./services/orderStatusHistory.service.js";
import type { OrderService } from "./services/order.service.js";
import type { OrderStatusHistoryService } from "./services/orderStatusHistory.service.js";

export function createOrderRoutes(deps: {
  authService: AuthService;
  orderService: OrderService;
  paymentService: PaymentService;
  statusHistoryService?: OrderStatusHistoryService;
}) {
  const router = new Hono<AppEnv>();
  const requireAuth = createRequireAuth(deps.authService);
  const validateOrderOwnership = createValidateOrderOwnership(deps.orderService);
  const statusHistoryService =
    deps.statusHistoryService ?? createOrderStatusHistoryService(db);

  router.use("*", requireAuth);

  router.post("/", createOrderController(deps.orderService));
  router.get("/export", exportOrdersController(deps.orderService));
  router.get("/", listOrdersController(deps.orderService));
  router.post("/:id/payments", validateOrderOwnership, recordPaymentController(deps.paymentService));
  router.get("/:id/payments", validateOrderOwnership, listPaymentsController(deps.paymentService));
  router.get("/:id/status-history", validateOrderOwnership, listStatusHistoryController(statusHistoryService));
  router.get("/:id", validateOrderOwnership, getOrderController(deps.orderService));
  router.patch("/:id", validateOrderOwnership, updateOrderController(deps.orderService));
  router.delete("/:id", validateOrderOwnership, deleteOrderController(deps.orderService));

  return router;
}
