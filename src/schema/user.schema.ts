import { object, string, TypeOf } from 'zod';

export const createUserSchema = object({
    body: object({
        name: string({
            required_error: 'Name is required'
        }),
        password: string({
            required_error: 'Password is required'
        }).min(5, 'Password is too short - should be 5 characters minuimum'),
        passwordConfirmation: string({
            required_error: 'Password Confirmation is Required'
        }),
        email: string({
            required_error: 'Email is required'
        }).email('not a valid email address')
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: 'Passwords do not match',
        path: ['passwordConfirmation']
    })
});

export const loginUserSchema = object({
    body: object({
        email: string({
            required_error: 'Email is required'
        }).email('Not A Valid Email'),
        password: string({
            required_error: 'Password is requird'
        })
    })
});

export type CreateUserInput = Omit<TypeOf<typeof createUserSchema>, 'body.passwordConfimation'>;

export type createSessionInput = TypeOf<typeof loginUserSchema>['body'];
