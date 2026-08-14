-- Payment actions -> payment_audit_log
CREATE OR REPLACE FUNCTION log_payment_action() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO payment_audit_log (payment_id, order_id, action, actor_id, amount_cents, paid_at, note)
    VALUES (OLD.id, OLD.order_id, 'delete', OLD.recorded_by, OLD.amount_cents, OLD.paid_at, OLD.note);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO payment_audit_log (payment_id, order_id, action, actor_id, amount_cents, paid_at, note)
    VALUES (NEW.id, NEW.order_id, 'update', NEW.recorded_by, NEW.amount_cents, NEW.paid_at, NEW.note);
    RETURN NEW;
  ELSE
    INSERT INTO payment_audit_log (payment_id, order_id, action, actor_id, amount_cents, paid_at, note)
    VALUES (NEW.id, NEW.order_id, 'insert', NEW.recorded_by, NEW.amount_cents, NEW.paid_at, NEW.note);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER payments_audit
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION log_payment_action();
--> statement-breakpoint
-- Order status transitions -> order_status_history
CREATE OR REPLACE FUNCTION log_order_status_change() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, actor_id)
    VALUES (NEW.id, NULL, NEW.status, NEW.user_id);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, actor_id)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
-- AFTER UPDATE OF status arms only when status is in the SET list; the IS DISTINCT
-- guard drops no-op writes so only real transitions are recorded.
CREATE TRIGGER orders_status_audit
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION log_order_status_change();
