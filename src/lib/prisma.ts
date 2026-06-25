import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { getISTDate } from "./date";

const MODEL_TIMESTAMP_FIELDS: Record<string, { created: string[]; updated: string[] }> = {
  User: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  OtpVerification: { created: ["createdAt"], updated: [] },
  Session: { created: ["createdAt"], updated: [] },
  Category: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  Product: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  ProductImage: { created: ["createdAt"], updated: [] },
  WeightOption: { created: [], updated: [] },
  CutType: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  ProductCutType: { created: [], updated: [] },
  Cart: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  CartItem: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  Address: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  Order: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  OrderItem: { created: [], updated: [] },
  OrderStatusHistory: { created: ["createdAt"], updated: [] },
  Payment: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  DeliverySettings: { created: [], updated: ["updatedAt"] },
  DeliverySlot: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  DeliveryZone: { created: ["createdAt"], updated: [] },
  Banner: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  Admin: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  AdminSession: { created: ["createdAt"], updated: [] },
  Wishlist: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  WishlistItem: { created: ["createdAt"], updated: [] },
  ProductReview: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  InventoryBatch: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  InventoryMovement: { created: ["createdAt"], updated: [] },
  BusinessSettings: { created: ["createdAt", "updatedAt"], updated: ["updatedAt"] },
  UserActivity: { created: ["createdAt"], updated: [] }
};

function getTargetModel(parentModel: string, relationKey: string): string | null {
  if (relationKey === "cart") return "Cart";
  if (relationKey === "wishlist") return "Wishlist";
  if (relationKey === "addresses") return "Address";
  if (relationKey === "sessions") return "Session";
  if (relationKey === "orders") return "Order";
  if (relationKey === "reviews") return "ProductReview";
  if (relationKey === "activities") return "UserActivity";
  if (relationKey === "images") return "ProductImage";
  if (relationKey === "weightOptions") return "WeightOption";
  if (relationKey === "allowedCuts") return "ProductCutType";
  if (relationKey === "inventoryBatches") return "InventoryBatch";
  if (relationKey === "movements") return "InventoryMovement";
  
  if (relationKey === "items") {
    if (parentModel === "Cart") return "CartItem";
    if (parentModel === "Order") return "OrderItem";
    if (parentModel === "Wishlist") return "WishlistItem";
  }
  return null;
}

function processQueryArgs(args: any, modelName: string, operation: string) {
  if (!args || typeof args !== "object") return;
  
  const now = getISTDate();

  function stampTimestamps(data: any, currentModel: string, isCreate: boolean) {
    if (!data || typeof data !== "object" || data instanceof Date) return;

    if (Array.isArray(data)) {
      for (const item of data) {
        stampTimestamps(item, currentModel, isCreate);
      }
      return;
    }

    const fields = MODEL_TIMESTAMP_FIELDS[currentModel];
    if (fields) {
      if (isCreate) {
        for (const f of fields.created) {
          if (data[f] === undefined) {
            data[f] = now;
          }
        }
      } else {
        for (const f of fields.updated) {
          if (data[f] === undefined) {
            data[f] = now;
          }
        }
      }
    }

    // Process known nested relation write patterns
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (!val || typeof val !== "object" || val instanceof Date) continue;

      const targetModel = getTargetModel(currentModel, key);
      if (!targetModel) continue;

      if (val.create !== undefined) {
        stampTimestamps(val.create, targetModel, true);
      }
      if (val.createMany?.data !== undefined) {
        stampTimestamps(val.createMany.data, targetModel, true);
      }
      if (val.update !== undefined) {
        stampTimestamps(val.update, targetModel, false);
      }
      if (val.upsert !== undefined) {
        const upsertData = Array.isArray(val.upsert) ? val.upsert : [val.upsert];
        for (const us of upsertData) {
          if (us.create !== undefined) stampTimestamps(us.create, targetModel, true);
          if (us.update !== undefined) stampTimestamps(us.update, targetModel, false);
        }
      }
    }
  }

  if (operation === "create" && args.data) {
    stampTimestamps(args.data, modelName, true);
  } else if (operation === "createMany" && args.data) {
    stampTimestamps(args.data, modelName, true);
  } else if (operation === "update" && args.data) {
    stampTimestamps(args.data, modelName, false);
  } else if (operation === "updateMany" && args.data) {
    stampTimestamps(args.data, modelName, false);
  } else if (operation === "upsert") {
    if (args.create) stampTimestamps(args.create, modelName, true);
    if (args.update) stampTimestamps(args.update, modelName, false);
  }
  // Read/delete operations are not processed — no timestamp injection needed.
}

const prismaClientSingleton = () => {
  const connectionString =
    process.env.DATABASE_URL ||
    "mysql://root:hello%20brother@localhost:3306/nonzo";
  const dbUrl = new URL(connectionString);

  const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || "3306"),
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ""),
    connectionLimit: 10,
  });

  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const basePrisma = globalThis.prismaGlobal ?? prismaClientSingleton();

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (model) {
          processQueryArgs(args, model, operation);
        }
        return query(args);
      }
    }
  }
});

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = basePrisma;
}
