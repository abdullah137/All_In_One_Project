import { stubString } from 'lodash';
import { object, string, TypeOf } from 'zod';

export const createUserSchema = object({
    body: object({
        username: string({
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

const payload = {
    body: object({
        username: string({
            required_error: 'Username is required'
        }),
        email: string({
            required_error: 'Email is required'
        }).email('Not A Valid Email'),
        password: string()
    })
};

const params = {
    params: object({
        userId: string({
            required_error: 'User ID is required'
        })
    })
};

export const updateUserProfile = object({
    ...payload,
    ...params
});

export type CreateUserInput = Omit<TypeOf<typeof createUserSchema>, 'body.passwordConfimation'>;

export type createSessionInput = TypeOf<typeof loginUserSchema>['body'];

export type updateUserInput = TypeOf<typeof updateUserProfile>;
