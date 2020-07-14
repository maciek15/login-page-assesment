import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@material-ui/core'
import ErrorIcon from '@material-ui/icons/Error'
import { Formik, Field, FieldInputProps, FieldMetaProps } from 'formik'

import { loginValidator } from '../validators'
import { login } from '../api/login'
import { Credentials } from '../types/credentials'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  min-width: 100%;
`
const StyledTextField = styled(TextField)`
  margin-bottom: 16px;
`
const StyledFormControlLabel = styled(FormControlLabel)`
  color: ${({ theme }) => theme.palette.neutral.dark};
  margin-bottom: 8px;
`
const StyledButton = styled(Button)`
  margin-top: 8px;
`
const FormError = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.palette.error.main};
  border: 1px solid ${({ theme }) => theme.palette.error.main};
  border-radius: 4px;
  padding: 8px 14px;

  .MuiSvgIcon-root {
    margin-right: 8px;
  }
`

interface LoginFormState {
  requestStatus: string
  formError?: string
}
interface FieldHelpers {
  field: FieldInputProps<string>
  meta: FieldMetaProps<string>
}

interface FormValues extends Credentials {
  shouldFail?: boolean
}

const initialValues: FormValues = { email: '', password: '', shouldFail: false }

class LoginForm extends React.Component<{}, LoginFormState> {
  state = {
    requestStatus: 'NONE',
    formError: '',
  }

  onSubmit = (data: FormValues) => {
    const credentials: Credentials = {
      email: data.email,
      password: data.password,
    }

    this.setState({ requestStatus: 'PENDING', formError: '' }, () =>
      login(credentials, data.shouldFail)
        .then(() => this.setState({ requestStatus: 'SUCCESS', formError: '' }))
        .catch(err => {
          this.setState({
            requestStatus: 'ERROR',
            formError: err.errorMessage || 'Unknown error occured',
          })
        })
    )
  }

  render() {
    const { requestStatus, formError } = this.state
    const isSubmitDisabled = requestStatus === 'PENDING'
    const hasError = requestStatus === 'ERROR'

    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.onSubmit}
        validationSchema={loginValidator}
      >
        {props => (
          <Form onSubmit={props.handleSubmit}>
            <Field name='email'>
              {({ field, meta }: FieldHelpers) => (
                <StyledTextField
                  {...field}
                  variant='outlined'
                  placeholder='Email'
                  error={!!meta.error}
                  helperText={meta.error}
                />
              )}
            </Field>

            <Field name='password'>
              {({ field, meta }: FieldHelpers) => (
                <StyledTextField
                  {...field}
                  type='password'
                  variant='outlined'
                  placeholder='Password'
                  error={!!meta.error}
                  helperText={meta.error}
                />
              )}
            </Field>

            <Field name='shouldFail'>
              {({ field, meta }: FieldHelpers) => (
                <StyledFormControlLabel
                  control={<Checkbox color='primary' {...field} />}
                  label='Should response be unsuccessful?'
                />
              )}
            </Field>
            {hasError && (
              <motion.div
                exit={{ opacity: 0, x: 30, y: 0 }}
                initial={{ opacity: 0, x: 30, y: 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FormError data-testid='login-form__form-error'>
                  <ErrorIcon color='error' /> {formError}
                </FormError>
              </motion.div>
            )}
            <StyledButton
              variant='contained'
              color='primary'
              size='large'
              type='submit'
              disabled={isSubmitDisabled}
            >
              Log in
            </StyledButton>
          </Form>
        )}
      </Formik>
    )
  }
}

export default LoginForm
