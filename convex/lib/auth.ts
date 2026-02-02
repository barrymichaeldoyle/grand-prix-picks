import type { Doc } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';

export async function getViewer(ctx: QueryCtx): Promise<Doc<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const clerkUserId = identity.subject;

  const existing = await ctx.db
    .query('users')
    .withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
    .unique();

  return existing ?? null;
}

export async function getOrCreateViewer(
  ctx: MutationCtx,
): Promise<Doc<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const clerkUserId = identity.subject;

  const existing = await ctx.db
    .query('users')
    .withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
    .unique();

  if (existing) return existing;

  const now = Date.now();
  const rawEmail =
    identity.email ??
    (Array.isArray(identity.emailAddresses) && identity.emailAddresses[0]);
  const email = typeof rawEmail === 'string' ? rawEmail : undefined;
  const displayName =
    identity.name ??
    identity.nickname ??
    (identity.givenName && identity.familyName
      ? `${identity.givenName} ${identity.familyName}`
      : undefined);

  const userId = await ctx.db.insert('users', {
    clerkUserId,
    email,
    displayName,
    isAdmin: false,
    createdAt: now,
    updatedAt: now,
  });

  const inserted = await ctx.db.get(userId);
  return inserted ?? null;
}

export function requireViewer(viewer: Doc<'users'> | null): Doc<'users'> {
  if (!viewer) {
    throw new Error('Not authenticated');
  }
  return viewer;
}

export function requireAdmin(viewer: { isAdmin?: boolean } | null): void {
  if (!viewer?.isAdmin) {
    throw new Error('Admin only');
  }
}

export function isAdmin(viewer: { isAdmin?: boolean } | null): boolean {
  return viewer?.isAdmin === true;
}
