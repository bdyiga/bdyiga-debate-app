import { getIronSession } from "iron-session";

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long_for_iron_session",
  cookieName: "ld_debate_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession(req, res) {
  return getIronSession(req, res, sessionOptions);
}

/**
 * Express middleware that attaches session user to req.user
 * and rejects unauthenticated requests.
 */
export function requireAuth(...allowedRoles) {
  return async (req, res, next) => {
    const session = await getSession(req, res);
    if (!session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (allowedRoles.length && !allowedRoles.includes(session.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = session.user;
    next();
  };
}
