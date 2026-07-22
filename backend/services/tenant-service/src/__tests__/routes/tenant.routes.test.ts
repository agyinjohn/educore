import request from 'supertest'
import express from 'express'
import tenantRoutes from '../../routes/tenant.routes'
import * as tenantService from '../../services/tenant.service'

jest.mock('../../models/School')
jest.mock('../../services/tenant.service')
jest.mock('../../config/db')
jest.mock('../../config/eventBus')

describe('Tenant Routes', () => {
    let app: express.Application

    beforeAll(() => {
        app = express()
        app.use(express.json())
        app.use('/api/v1/tenants', tenantRoutes)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('POST /create', () => {
        it('should successfully create a new school', async () => {
            const schoolData = {
                name: 'Test School',
                subdomain: 'testschool',
                email: 'admin@testschool.com',
                address: '123 Main St',
                phone: '+1234567890',
                city: 'Test City',
                state: 'TS',
                country: 'TC',
                zipCode: '12345',
            }

                ; (jest.spyOn(tenantService, 'createSchool') as jest.Mock).mockResolvedValue({
                    _id: 'school-123',
                    name: schoolData.name,
                    subdomain: schoolData.subdomain,
                } as any)

            const response = await request(app)
                .post('/api/v1/tenants/create')
                .set('Authorization', 'Bearer owner-token')
                .send(schoolData)

            expect([200, 201]).toContain(response.status)
        })

        it('should fail with duplicate subdomain', async () => {
            const schoolData = {
                name: 'Test School',
                subdomain: 'existing',
                email: 'admin@existing.com',
                address: '123 Main St',
                phone: '+1234567890',
                city: 'Test City',
                state: 'TS',
                country: 'TC',
                zipCode: '12345',
            }

                ; (jest.spyOn(tenantService, 'createSchool') as jest.Mock).mockRejectedValue(new Error('Subdomain already exists'))

            const response = await request(app)
                .post('/api/v1/tenants/create')
                .set('Authorization', 'Bearer owner-token')
                .send(schoolData)

            expect(response.status).toBeGreaterThanOrEqual(400)
        })

        it('should fail without authentication', async () => {
            const schoolData = {
                name: 'Test School',
                subdomain: 'testschool',
                email: 'admin@testschool.com',
                address: '123 Main St',
                phone: '+1234567890',
                city: 'Test City',
                state: 'TS',
                country: 'TC',
                zipCode: '12345',
            }

            const response = await request(app)
                .post('/api/v1/tenants/create')
                .send(schoolData)

            expect(response.status).toBe(401)
        })
    })

    describe('GET /:id', () => {
        it('should retrieve a school by ID', async () => {
            ; (jest.spyOn(tenantService, 'getSchoolById') as jest.Mock).mockResolvedValue({
                _id: 'school-123',
                name: 'Test School',
                subdomain: 'testschool',
            } as any)

            const response = await request(app)
                .get('/api/v1/tenants/school-123')
                .set('Authorization', 'Bearer user-token')

            expect(response.status).toBe(200)
        })

        it('should fail with non-existent school ID', async () => {
            ; (jest.spyOn(tenantService, 'getSchoolById') as jest.Mock).mockRejectedValue(new Error('School not found'))

            const response = await request(app)
                .get('/api/v1/tenants/nonexistent-id')
                .set('Authorization', 'Bearer user-token')

            expect(response.status).toBeGreaterThanOrEqual(400)
        })
    })

    describe('GET /subdomain/:subdomain', () => {
        it('should retrieve school by subdomain', async () => {
            ; (jest.spyOn(tenantService, 'getSchoolBySubdomain') as jest.Mock).mockResolvedValue({
                _id: 'school-123',
                name: 'Test School',
                subdomain: 'testschool',
            } as any)

            const response = await request(app)
                .get('/api/v1/tenants/subdomain/testschool')

            expect(response.status).toBe(200)
        })

        it('should fail with non-existent subdomain', async () => {
            ; (jest.spyOn(tenantService, 'getSchoolBySubdomain') as jest.Mock).mockRejectedValue(new Error('School not found'))

            const response = await request(app)
                .get('/api/v1/tenants/subdomain/nonexistent')

            expect(response.status).toBeGreaterThanOrEqual(400)
        })
    })

    describe('PUT /update/:id', () => {
        it('should successfully update school information', async () => {
            const updateData = {
                name: 'Updated School Name',
                phone: '+9876543210',
            }

                ; (jest.spyOn(tenantService, 'updateSchool') as jest.Mock).mockResolvedValue({
                    _id: 'school-123',
                    ...updateData,
                } as any)

            const response = await request(app)
                .put('/api/v1/tenants/update/school-123')
                .set('Authorization', 'Bearer owner-token')
                .send(updateData)

            expect(response.status).toBe(200)
        })

        it('should fail without proper authorization', async () => {
            const updateData = {
                name: 'Updated School Name',
            }

            const response = await request(app)
                .put('/api/v1/tenants/update/school-123')
                .set('Authorization', 'Bearer student-token')
                .send(updateData)

            expect(response.status).toBeGreaterThanOrEqual(403)
        })
    })

    describe('DELETE /:id', () => {
        it('should successfully delete a school', async () => {
            ; (jest.spyOn(tenantService, 'deleteSchool') as jest.Mock).mockResolvedValue({
                deletedCount: 1,
            } as any)

            const response = await request(app)
                .delete('/api/v1/tenants/school-123')
                .set('Authorization', 'Bearer owner-token')

            expect(response.status).toBe(200)
        })

        it('should fail without owner authorization', async () => {
            const response = await request(app)
                .delete('/api/v1/tenants/school-123')
                .set('Authorization', 'Bearer student-token')

            expect(response.status).toBeGreaterThanOrEqual(403)
        })
    })

    describe('GET /list', () => {
        it('should list all schools', async () => {
            ; (jest.spyOn(tenantService, 'listSchools') as jest.Mock).mockResolvedValue({
                data: [
                    { _id: 'school-1', name: 'School 1' },
                    { _id: 'school-2', name: 'School 2' },
                ],
                total: 2,
            } as any)

            const response = await request(app)
                .get('/api/v1/tenants/list')
                .set('Authorization', 'Bearer admin-token')

            expect(response.status).toBe(200)
        })
    })

    describe('POST /academic-year/:id', () => {
        it('should add academic year to school', async () => {
            const academicYearData = {
                year: '2024-2025',
                startDate: '2024-09-01',
                endDate: '2025-06-30',
            }

                ; (jest.spyOn(tenantService, 'addAcademicYear') as jest.Mock).mockResolvedValue({
                    _id: 'school-123',
                    academicYears: [academicYearData],
                } as any)

            const response = await request(app)
                .post('/api/v1/tenants/academic-year/school-123')
                .set('Authorization', 'Bearer admin-token')
                .send(academicYearData)

            expect(response.status).toBe(200)
        })
    })

    describe('POST /campus/:id', () => {
        it('should add campus to school', async () => {
            const campusData = {
                name: 'Main Campus',
                address: '456 Campus Ave',
                phone: '+9999999999',
            }

                ; (jest.spyOn(tenantService, 'addCampus') as jest.Mock).mockResolvedValue({
                    _id: 'school-123',
                    campuses: [campusData],
                } as any)

            const response = await request(app)
                .post('/api/v1/tenants/campus/school-123')
                .set('Authorization', 'Bearer admin-token')
                .send(campusData)

            expect(response.status).toBe(200)
        })
    })

    describe('POST /suspend/:id', () => {
        it('should suspend a school', async () => {
            ; (jest.spyOn(tenantService, 'suspendSchool') as jest.Mock).mockResolvedValue({
                _id: 'school-123',
                status: 'suspended',
            } as any)

            const response = await request(app)
                .post('/api/v1/tenants/suspend/school-123')
                .set('Authorization', 'Bearer admin-token')

            expect(response.status).toBe(200)
        })
    })
})
