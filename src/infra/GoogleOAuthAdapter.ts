import * as axios from "axios";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "../constant/env";

class GoogleOAuthAdapter {
  private httpClient = axios.default.create();

  /**
   * Google Consent Screen (구글의 로그인 페이지)으로 가는 URI를 리턴합니다.
   * 이 URI로 클라이언트 웹 브라우저를 리다이렉트 시키는 용도입니다.
   */
  generateAuthURI(): string {
    const searchParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "email profile",
      access_type: "offline",
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${searchParams.toString()}`;
    return authUrl;
  }

  /**
   * 구글 OAuth AccessToken 발급을 요청합니다.
   */
  async getAccessToken(code: string): Promise<string> {
    const response = await this.httpClient.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }
    );

    return response.data.access_token;
  }

  /**
   * 구글 OAuth AccessToken을 이용해 사용자 프로필 정보를 가져옵니다.
   */
  async getProfile(accessToken: string): Promise<{
    email: string;
    nickname: string;
    image: string | null;
  }> {
    const response = await this.httpClient.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        params: { access_token: accessToken },
      }
    );

    const { email, name, picture } = response.data;

    return {
      email,
      nickname: name,
      image: picture || null,
    };
  }
}

export const googleOAuthHelper = new GoogleOAuthAdapter();
