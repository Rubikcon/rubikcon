import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app/app'

// Note: Integration tests hit the real application stack (Router -> Controller -> Service -> Repository).
// You would typically use a test database here.

describe('CourseCatalog Integration', () => {
  it('GET /academy/courses/:slug should return 404 for non-existent course', async () => {
    const response = await request(app).get('/academy/courses/this-does-not-exist')
    
    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/Course not found/i)
  })

  // To truly test success, you'd seed the DB before the test and assert 200 OK.
})
