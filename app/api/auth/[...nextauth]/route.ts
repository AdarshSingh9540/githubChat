import NextAuth from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
              username: { label: 'email', type: 'text', placeholder: '' },
              password: { label: 'password', type: 'password', placeholder: '' },
            },
            async authorize() {
                
                return {
                    id: "user1",
                    name:"adarsh",
                    email:"adarsh9540@gmail.com"
                };
            },
          }),
          GitHubProvider({
            clientId: process.env.GITHUB_ID|| '',
            clientSecret: process.env.GITHUB_SECRET ||''
          }),

          
          // GoogleProvider({
          //   clientId: process.env.GOOGLE_CLIENT_ID||'',
          //   clientSecret: process.env.GOOGLE_CLIENT_SECRET||''
          // })
          
      ],
      secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }