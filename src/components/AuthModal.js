import React, { useState } from 'react'
import { Auth } from "aws-amplify";
import { Space, Typography, Button, Input } from "antd";

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
  return (
    <div>
      {mode === 'SIGN_UP' &&
        <Space direction='vertical'>
          <Title level={3}>Sign up with a new account</Title>
          <Text>Username</Text>
          <Input placeholder='Username' value={username} onChange={e => setUserName(e.target.value)} />
          <Text>Email</Text>
          <Input placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
          <Text>Password</Text>
          <Input.Password placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
          <Button loading={isDoingThing} block type='primary' onClick={signUpClicked}>Sign Up</Button>
          <Space direction='horizontal'>
            <Text>Already have an account?</Text>
            <Button type='link' onClick={e => setMode('SIGN_IN')}>Sign in</Button>
          </Space>
        </Space>
      }
      {mode === 'SIGN_IN' &&
        <Space direction='vertical'>
          <Title level={3}>Sign in with your username and password</Title>
          <Text>Username</Text>
          <Input placeholder='Username' value={username} onChange={e => setUserName(e.target.value)} />
          <Text>Password</Text>
          <Input.Password placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
          <Button type='link' onClick={e => setMode('RECOVER')}>Forgot your password?</Button>
          <Button loading={isDoingThing} block type='primary' onClick={signInClicked}>Sign in</Button>
          <Space direction='horizontal'>
            <Text>Need an account?</Text>
            <Button type='link' onClick={e => setMode('SIGN_UP')}>Sign up</Button>
          </Space>
        </Space>
      }
      {mode === 'RECOVER' &&
        <Space direction='vertical'>
          <Title>Forgot your password?</Title>
          <Text>Enter your Username below and we will send an email to reset your password</Text>
          <Input placeholder='username' value={username} onChange={e => setUserName(e.target.value)}></Input>
          <Button loading={isDoingThing} block type='primary' onClick={resetPasswordClicked}>Reset my password</Button>
          <Button type='link' onClick={e => setMode('RESET_CODE')}>Already have a code? Click here to enter.</Button>
        </Space>
      }
      {mode === 'RESET_CODE' &&
        <Space direction='vertical'>
          <Title>Reset your password</Title>
          <Text>Username</Text>
          <Input placeholder='username' value={username} onChange={e => setUserName(e.target.value)}></Input>
          <Text>Enter password reset code from email</Text>
          <Input placeholder='Reset code' value={resetCode} onChange={e => setResetCode(e.target.value)} />
          <Text>New password</Text>
          <Input.Password placeholder='New password' value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <Button loading={isDoingThing} block type='primary' onClick={confirmChangePassword}>Change password</Button>
        </Space>
      }
    </div>
  )
}