// Run with: npm test
//
// The owner's user search (src/lib/admin/accounts.ts): plain comparisons,
// so nothing typed into the search box can become a query expression.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { filterAccounts, type Account } from '../src/lib/admin/accounts.ts'

const a = (id: string, name: string, email: string, role: Account['role'], status: Account['status'], phone: string | null = null): Account =>
  ({ id, name, email, role, status, phone, createdAt: '2026-10-01T00:00:00Z' })
const ALL = [
  a('1', 'Sample Student', 'student@example.test', 'student', 'approved', '+20 100 000 0001'),
  a('2', 'Sample Parent', 'parent@example.test', 'parent', 'pending'),
  a('3', 'Other', 'other@example.test', 'student', 'suspended'),
]

test('search matches name, email or phone (spaces ignored)', () => {
  assert.deepEqual(filterAccounts(ALL, { q: 'sample' }).map((x) => x.id), ['1', '2'])
  assert.deepEqual(filterAccounts(ALL, { q: 'OTHER@' }).map((x) => x.id), ['3'])
  assert.deepEqual(filterAccounts(ALL, { q: '1000000001' }).map((x) => x.id), ['1'])
  assert.deepEqual(filterAccounts(ALL, { q: '100 000 0001' }).map((x) => x.id), ['1'])
})

test('role and status filter exactly', () => {
  assert.deepEqual(filterAccounts(ALL, { role: 'student' }).map((x) => x.id), ['1', '3'])
  assert.deepEqual(filterAccounts(ALL, { role: 'student', status: 'suspended' }).map((x) => x.id), ['3'])
})

test('filter syntax in the search box is just text', () => {
  assert.deepEqual(filterAccounts(ALL, { q: 'role.eq.owner,email.ilike.*' }), [])
  assert.deepEqual(filterAccounts(ALL, { q: "' or 1=1 --" }), [])
})
