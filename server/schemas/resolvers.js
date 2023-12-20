const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        console.log(context.user)
        if (context.user) {
          const user = await User.findOne({ _id: context.user._id });
          console.log(user)
          return user
        }
        throw AuthenticationError('You need to be logged in!');
      },
    },
  
    Mutation: {
      addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        console.log(email, password)
        if (!user) {
          throw AuthenticationError('No user found with this email address');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
  
        return { token, user };
      },
      saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
        if (context.user) {
  
          const user = await User.findOneAndUpdate(
            { _id: context.user._id },
            {
              $addToSet: {
                savedBooks: {
                  authors, description: description?description:"no description ", title, bookId, image, link
                }
              }
            }
          );
  
          return user;
        }
        throw AuthenticationError('You need to be logged in!');
      },
  
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
  
          const user = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );
  
          return user;
        }
        throw AuthenticationError('You need to be logged in!');
      },
    },
  };
  
  module.exports = resolvers;