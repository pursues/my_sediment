import Cookies from 'universal-cookie'

const cookies = new Cookies()
type EnvType = 'prod' | 'dev'

class Token {
  env: EnvType
  tokenKey: string
  refreshTokenKey: string
  constructor(env: EnvType = 'prod', prefix: string) {
    this.env = env
    this.tokenKey = `${prefix}_token`
    this.refreshTokenKey = `${prefix}_refreshToken`
  }

  getCookieName(prefix: string) {
    if (this.env === 'prod')
      return `${prefix}`

    else
      return `${prefix}_dev`
  }

  get token() {
    return cookies.get(this.getCookieName(this.tokenKey))
  }

  get refreshToken() {
    return cookies.get(this.getCookieName(this.refreshTokenKey))
  }

  setToken(token: string) {
    if (!token)
      return

    const options: Record<string, any> = {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    }

    if (this.env === 'prod') {
      // 生产环境是否为HTTPS？不是的话，带 secure 的 Cookie 不会落盘或不发送，
      // 跨域访问场景且使用HTTPS（不同子域名）的场景下， sameSite='none' secure = true
      // 暂时为http，因为http会导致coookie不发送,所以注释掉
      

      // options.sameSite = 'none'
      // options.secure = true
    }
    cookies.set(this.getCookieName(this.tokenKey), token, options)
  }

  setRefreshToken(refreshToken: string) {
    if (!refreshToken)
      return

    const options: Record<string, any> = {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    }

    if (this.env === 'prod') {
      options.sameSite = 'none'
      options.secure = true
    }
    cookies.set(this.getCookieName(this.refreshTokenKey), refreshToken, options)
  }

  removeToken() {
    cookies.remove(this.getCookieName(this.tokenKey), { path: '/' })
  }

  removeRefreshToken() {
    cookies.remove(this.getCookieName(this.refreshTokenKey), { path: '/' })
  }
}

export default Token
