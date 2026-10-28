import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, GraduationCap, LockKeyhole, Mail, Sparkles, Lock } from 'lucide-react'
import { useApp } from '../app-context'
import { Modal } from './Modal'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, toast, t } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(false)

  const finish = (nextName: string, nextEmail: string, student = false) => {
    login({ name: nextName, email: nextEmail, student })
    // 使用字典里的带变量翻译
    toast(t(isLogin ? '欢迎回来，{name}。' : '欢迎来到 BullU，{name}。', { name: nextName }))
    onClose()
    setName('')
    setEmail('')
    setPassword('')
    setError('')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!isLogin && !name.trim()) {
      setError(t('先告诉我们怎么称呼你。'))
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('请输入一个有效的邮箱地址。'))
      return
    }
    if (password.length < 6) {
      setError(t('密码至少需要 6 位。'))
      return
    }

    setLoading(true)
    const endpoint = isLogin ? '/api/login' : '/api/register'

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.trim(), password: password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('bullu_token', data.token);
        const displayName = isLogin ? (data.user?.username?.split('@')[0] || '同学') : name.trim();
        localStorage.setItem('bullu_user', JSON.stringify({ name: displayName, email: email.trim() }));
        finish(displayName, email.trim())
      } else {
        setError(data.message || t('操作失败，请重试。'))
      }
    } catch (err) {
      console.error(err)
      setError(t('网络连接失败，请检查后端服务是否启动。'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" className="auth-modal" ariaLabel={t('加入 BullU')}>
      <div className="auth-modal__grid">
        <div className="auth-modal__visual">
          < img src="./images/students-collab.jpg" alt={t('学生在一起学习')} />
          <div className="auth-modal__overlay" />
          <div className="auth-modal__quote">
            <span className="auth-modal__pill">
              <Sparkles size={12} strokeWidth={2} /> ONE CAMPUS, ONE PLACE
            </span>
            <h2>{t('你的 UKM 生活，')}<br />{t('从这里开始。')}</h2>
            <p>{t('找到教室、认识同学、把闲置传给下一位同学。')}</p >
          </div>
        </div>
        <div className="auth-modal__form">
          <span className="eyebrow">
            <span>{isLogin ? 'LOGIN' : 'JOIN BULLU'}</span>
            <i />
            {t('学生免费使用')}
          </span>
          <h3>{isLogin ? t('欢迎回来') : t('欢迎来到 BullU')}</h3>
          <p className="auth-modal__intro">
            {isLogin ? t('输入你的邮箱和密码继续探索。') : t('用普通邮箱即可开始探索。完成 UKM 学生认证后，会获得可信学生标识。')}
          </p >

          <form onSubmit={submit} className="auth-form">
            {!isLogin && (
              <label className="field">
                <span>{t('怎么称呼你')}</span>
                <span className="field__control">
                  <GraduationCap size={17} strokeWidth={1.9} />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t('例如：林知夏')}
                    autoComplete="name"
                    disabled={loading}
                  />
                </span>
              </label>
            )}

            <label className="field">
              <span>{t('邮箱')}</span>
              <span className="field__control">
                <Mail size={17} strokeWidth={1.9} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  disabled={loading}
                />
              </span>
            </label>
            
            <label className="field">
              <span>{t('设置密码')}</span>
              <span className="field__control">
                <Lock size={17} strokeWidth={1.9} />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t('至少 6 位字符')}
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  disabled={loading}
                />
              </span>
            </label>

            {error && <p className="form-error">{error}</p >}
            
            <button type="submit" className="button button--blue button--full" disabled={loading}>
              {loading ? t('处理中...') : (isLogin ? t('登录') : t('注册并进入'))} 
              {!loading && <ArrowRight size={16} strokeWidth={2} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
            <span style={{ color: '#666' }}>
              {isLogin ? t('还没有账号？') : t('已经有账号了？')}
            </span>
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', marginLeft: '4px', fontWeight: 'bold' }}
            >
              {isLogin ? t('去注册') : t('去登录')}
            </button>
          </div>

          <p className="auth-modal__fine" style={{ marginTop: '24px' }}>
            <LockKeyhole size={12} strokeWidth={2} />
            {t('你的账号信息安全加密，保存在云端服务器中。')} 
          </p >
        </div>
      </div>
    </Modal>
  )
}