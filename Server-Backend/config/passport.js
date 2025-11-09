import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const email = profile.emails && profile.emails[0]?.value;
				if (!email) {
					return done(new Error("Google account has no public email"), null);
				}

				let user = await User.findOne({ email });

				if (!user) {
					user = await User.create({
						username: profile.displayName || email.split("@")[0],
						email,
						googleId: profile.id,
						verified: true, 
						role: "student",
					});
				} else if (!user.googleId) {
					user.googleId = profile.id;
					user.verified = true;
					await user.save();
				}

				return done(null, user);
			} catch (err) {
				return done(err, null);
			}
		}
	)
);


export default passport;
