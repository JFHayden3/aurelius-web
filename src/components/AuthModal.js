import React, { useState } from 'react'
import { Auth } from "aws-amplify";
import { Space, Typography, Button, Input, Form } from "antd";

const { Text, Title } = Typography

export const AuthModal = ({ initialMode }) => {
  const [mode, setMode] = useState(initialMode)
  const [username, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [isDoingThing, setDoingThing] = useState(false)
  const onAsyncResult = r => {
    console.log('\n\n' + JSON.stringify(r) + '\n\n')
    setDoingThing(false)
  }

  const signUpClicked = e => {
    setDoingThing(true)
    Auth.signUp({
      username: username,
      password: password,
      attributes: {
        email: email
      }
    }).then(onAsyncResult, onAsyncResult)
  }
  const signInClicked = e => {
    setDoingThing(true)
    Auth.signIn(username, password).then(onAsyncResult, onAsyncResult)
  }
  const resetPasswordClicked = e => {
    Auth.forgotPassword(username).then(onAsyncResult, onAsyncResult)
    setMode('RESET_CODE')
  }
  const confirmChangePassword = e => {
    setDoingThing(true)
    Auth.forgotPasswordSubmit(username, resetCode, newPassword).then(onAsyncResult, onAsyncResult)
  }
  const formItemStyle = { marginBottom: '8px' }
  return (
    <div>
      {mode === 'SIGN_UP' &&
        // TODO: name/email uniqueness checks
        <Form name='signup' layout='vertical'>
          <Title level={3}>Sign up with a new account</Title>
          <Form.Item
            style={formItemStyle}
            required={false}
            label='Username' name='username'
            rules={[{ required: true, message: 'Please input a username' },
            { min: 6, message: 'Username must be at least 6 characters' }]}>
            <Input placeholder='Username' value={username} onChange={e => setUserName(e.target.value)} />
          </Form.Item>
          <Form.Item
            style={formItemStyle}
            required={false}
            label='Email' name='email'
            rules={[{ required: true, message: 'Please input your email' }]}>
            <Input placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
          </Form.Item>
          <Form.Item
            style={formItemStyle}
            required={false}
            label='Password' name='password'
            rules={[
              { required: true, message: 'Please input a password' },
              { min: 8, message: 'Password must be at least 8 characters' }]}>
            <Input.Password placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
          </Form.Item>
          <Form.Item style={formItemStyle}>
            <Button loading={isDoingThing} block type='primary' htmlType='submit' onClick={signUpClicked}>Sign Up</Button>
          </Form.Item>
          <Space direction='horizontal' size='small'>
            <Text>Already have an account?</Text>
            <Button type='link' onClick={e => setMode('SIGN_IN')}>Sign in</Button>
          </Space>
        </Form>
      }
      {mode === 'SIGN_IN' &&
        <Form name='signin' layout='vertical'>
          <Title level={3}>Sign in with your username and password</Title>
          <Form.Item
            style={formItemStyle}
            required={false}
            label='Username' name='username'
            rules={[{ required: true, message: 'Please input your username' },
            ]}>
            <Input placeholder='Username' value={username} onChange={e => setUserName(e.target.value)} />
          </Form.Item>
          <Form.Item
            style={formItemStyle}
            required={false}
            label='Password' name='password'
            rules={[
              { required: true, message: 'Please input a password' },
            ]}>
            <Input.Password placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
          </Form.Item>
          <Button style={{ marginBottom: '8px' }} type='link' onClick={e => setMode('RECOVER')}>Forgot your password?</Button>
          <Form.Item style={formItemStyle}>
            <Button loading={isDoingThing} block type='primary' htmlType='submit' onClick={signInClicked}>Sign in</Button>
          </Form.Item>
          <Space direction='horizontal'>
            <Text>Need an account?</Text>
            <Button type='link' onClick={e => setMode('SIGN_UP')}>Sign up</Button>
          </Space>
        </Form>
      }
      {mode === 'RECOVER' &&
        <Space direction='vertical'>
          <Title>Forgot your password?</Title>
          <Text>Enter your Username below and we will send an email to reset your password</Text>
          <Input placeholder='Username' value={username} onChange={e => setUserName(e.target.value)}></Input>
          <Button loading={isDoingThing} block type='primary' onClick={resetPasswordClicked}>Reset my password</Button>
          <Button type='link' onClick={e => setMode('RESET_CODE')}>Already have a code? Click here to enter.</Button>
        </Space>
      }
      {mode === 'RESET_CODE' &&
        <Form name='reset' layout='vertical'>
          <Title>Reset your password</Title>
          <Form.Item
            style={formItemStyle}
            required={false}
            label='Username' name='username'
            rules={[{ required: true, message: 'Please input your username' },
            ]}>
            <Input placeholder='Username' value={username} onChange={e => setUserName(e.target.value)} />
          </Form.Item>
          <Form.Item
            style={formItemStyle}
            required={false}
            name='code' label='Enter password reset code from email'
            rules={[{ required: true, message: 'Please input your reset code' },
            ]}
            >
            <Input placeholder='Reset code' value={resetCode} onChange={e => setResetCode(e.target.value)} />
          </Form.Item>
          <Form.Item
            style={formItemStyle}
            required={false}
            label='New password' name='new-password'
            rules={[
              { required: true, message: 'Please input a password' },
              { min: 8, message: 'Password must be at least 8 characters' }]}>
            <Input.Password placeholder='New password' value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </Form.Item>
          <Form.Item>
            <Button loading={isDoingThing} block type='primary' htmlType='submit' onClick={confirmChangePassword}>Change password</Button>
          </Form.Item>
        </Form>
      }
    </div>
  )
}