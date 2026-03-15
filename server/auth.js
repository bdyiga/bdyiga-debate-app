import { supabaseAdmin } from "./supabase.js";
import prisma from "./prisma.js";

/**
 * Resolves or creates the local User row for a verified Supabase auth user.
 */
async function getOrCreateUser(supabaseUser) {
  let user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });

  if (!user) {
    const meta = supabaseUser.user_metadata || {};
    user = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        name: meta.name || supabaseUser.email,
        role: ["MANAGER", "JUDGE", "STUDENT"].includes(meta.role)
          ? meta.role
          : "STUDENT",
      },
    });
  }

  return user;
}

/**
 * Express middleware — verifies the Supabase JWT from the Authorization header,
 * resolves the local User, and attaches it to req.user.
 * Optionally restricts access to specific roles.
 */
export function requireAuth(...allowedRoles) {
  return async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = header.slice(7);
    const {
      data: { user: supabaseUser },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await getOrCreateUser(supabaseUser);

    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    next();
  };
}
