import Stripe from 'stripe';
import config from 'config';
import UserModel from '../models/user.js'
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
dotenv.config()
// const stripe = new Stripe(config.SECRET_KEY);

export const getUser = async (req, res) => {
  let response = await UserModel.find({})
  res.status(201).json({ user: response });
}
export const signup = async (req, res) => {

  const { name, email, password } = req.body;
  try {
    if (await UserModel.findOne({ email: email }).exec()) {
      res.status(201).json({ message: false, error: 'Already Exists' });
    }
    else {
      await UserModel.create({ name, email, password });
      UserModel.find({ email: email }, function (err, docs) {
        var transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
            user: config.get('EMAIL'),
            pass: config.get('PASSWORD')
          }
        });
        var mailOptions = {
          from: {
            name: 'no-reply',
            address: config.get('EMAIL')
          },
          to: email,
          subject: "Account Created",

          html: `<h1>Thank you for signing up with us </h1><p>\
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.\
                  </p>`
        };

        try {
          transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
              console.log("not sent: ", error);
            }
          });
          jwt.sign(
            { id: docs[0].id },
            process.env.JWT_KEY,
            { expiresIn: "3h" },
            (err, token) => {
              try {
                return res.status(201).json({ message: true, token, user: docs[0] });
              } catch (error) {
                return res.status(202).json({ message: error.message });
              }
            }
          )
        } catch (error) {
          res.status(201).json({ message: false, error: error.message });

        }
      })
    }
  }
  catch (err) {
    console.log(err.message)
  }
}

export const login = async (req, res) => {

  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email })
    if (!user) {
      res.status(201).json({ message: false, error: 'Invalid user' });
    }
    console.log('password', password)
    const validate = await user.isValidPassword(password)
    if (!validate) {
      res.status(201).json({ message: false, error: 'Wrong password' });
    }

    jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "3h" },
      (err, token) => {
        try {
          res.status(201).json({ message: true, token, user });
        } catch (error) {
          res.status(202).json({ message: false, error: error.message });
        }
      }
    )
  }

  catch (err) {
    console.log('err: ',err.message)
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(202).json({ message: false, error: 'Such user does not exists' })
    }
    var transporter = nodemailer.createTransport({

      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: config.get('EMAIL'),
        pass: config.get('PASSWORD')
      },

    });
    const expire = Date.now() + 3600000;
    const resetCode = 1 + Math.floor(Math.random() * 10000);

    var mailOptions = {
      from: {
        name: 'password-reset',
        address: process.env.EMAIL
      },
      to: user.email,
      subject: "Reset password link",

      html: `<h1>You requested for password reset </h1><p>\
              If you have requested to reset your password then use the code below to reset password for your account<br/>\
              <h1>${resetCode}</h1><br/>\
              This code will expire within 1 hour.<br/>\
  </p>`
    };

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        return res.status(202).json({ message: false, error: error.message })
      } else {
        await UserModel.findByIdAndUpdate(user._id, { expires: expire }, { new: true });
        return res.status(202).json({ message: true, success: 'Check your email', resetCode })
      }
    });

  } catch (err) {
    return res.status(202).json({ message: false, error: err.message })
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    var { email, password } = req.body

    let user = await UserModel.findOne({ email, expires: { $gt: Date.now() } })

    if (!user) {
      return res.status(202).json({ message: false, error: "Try again sesssion expired!" });
    } else {
      password = await bcrypt.hash(password, 10)
      user = await UserModel.findByIdAndUpdate({ _id: user._id }, { password, expires: '' }, { new: true })
      return res.status(202).json({ message: true, success: 'Password reset successfully.' })
    }

  } catch (error) {
    return res.status(202).json({ message: false, error: error.message })

  }
}

// export const payment = async (req, res) => {
//   const customer = await stripe.customers
//     .create({
//       email: req.body.user.email,
//       name: req.body.user.name
//     })

//   const line_items = req.body.cartItems.map((item) => {
//     return {
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: item.name,
//           metadata: {
//             id: item.id,
//           },
//         },
//         unit_amount: item.price * 100,
//       },
//       quantity: item.quantity,
//     };
//   });

//   const session = await stripe.checkout.sessions.create({
//     customer: customer.id,
//     payment_method_types: ["card"],
//     line_items,
//     mode: "payment",
//     success_url: `${process.env.CLIENT_URL}/success`,
//     cancel_url: `${process.env.CLIENT_URL}/checkout`,
//   })
//   res.status(202).json({ url: session.url });
// };
