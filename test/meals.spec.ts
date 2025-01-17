import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex -- migrate:rollback --all')
        execSync('npm run knex -- migrate:latest')
    })

    it('should be able to create a new meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Breakfast',
                description: "It's a breakfast",
                on_diet: "Yes",
                date_and_time: new Date(),
            })
            .expect(201)
    })

    it('should be able to list all meals from a user', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Breakfast',
                description: "It's a breakfast",
                on_diet: "Yes",
                date_and_time: new Date(),
            })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Lunch',
                description: "It's a lunch",
                on_diet: "Yes",
                date_and_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day after
            })
            .expect(201)

        const mealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .expect(200)

        expect(mealsResponse.body.meals).toHaveLength(2)

        // This validate if the order is correct
        expect(mealsResponse.body.meals[0].meal_name).toBe('Breakfast')
        expect(mealsResponse.body.meals[1].meal_name).toBe('Lunch')
    })

    it('should be able to show a single meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Breakfast',
                description: "It's a breakfast",
                on_diet: "Yes",
                date_and_time: new Date(),
            })
            .expect(201)

        const mealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .expect(200)

        const mealId = mealsResponse.body.meals[0].id

        const mealResponse = await request(app.server)
            .get(`/meals/${mealId}`)
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .expect(200)

        expect(mealResponse.body).toEqual({
            meals: expect.objectContaining({
                meal_name: 'Breakfast',
                description: "It's a breakfast",
                on_diet: "Yes",
                date_and_time: expect.any(String),
            }),
        })
    })

    it('should be able to update a meal from a user', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Breakfast',
                description: "It's a breakfast",
                on_diet: "Yes",
                date_and_time: new Date(),
            })
            .expect(201)

        const mealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .expect(200)

        const mealId = mealsResponse.body.meals[0].id

        await request(app.server)
            .put(`/meals/${mealId}`)
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Dinner',
                description: "It's a dinner",
                on_diet: "Yes",
                date: new Date(),
            })
            .expect(204)
    })

    it('should be able to delete a meal from a user', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Breakfast',
                description: "It's a breakfast",
                on_diet: "Yes",
                date_and_time: new Date(),
            })
            .expect(201)

        const mealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .expect(200)

        const mealId = mealsResponse.body.meals[0].id

        await request(app.server)
            .delete(`/meals/${mealId}`)
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .expect(204)
    })

    it('should be able to get metrics from a user', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Breakfast',
                description: "It's a breakfast",
                on_diet: "Yes",
                date_and_time: new Date('2021-01-01T08:00:00'),
            })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Lunch',
                description: "It's a lunch",
                on_diet: "No",
                date_and_time: new Date('2021-01-01T12:00:00'),
            })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Snack',
                description: "It's a snack",
                on_diet: "Yes",
                date_and_time: new Date('2021-01-01T15:00:00'),
            })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Dinner',
                description: "It's a dinner",
                on_diet: "Yes",
                date_and_time: new Date('2021-01-01T20:00:00'),
            })

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .send({
                meal_name: 'Breakfast',
                description: "It's a breakfast",
                on_diet: "Yes",
                date_and_time: new Date('2021-01-02T08:00:00'),
            })

        const metricsResponse = await request(app.server)
            .get('/meals/metrics')
            .set('Cookie', userResponse.get('Set-Cookie')!)
            .expect(200)

        expect(metricsResponse.body.metrics).toEqual({
            count: 5,
            count_on_diet: 4,
            count_not_on_diet: 1,
            best_on_diet_sequence: 3,
        })
    })
})