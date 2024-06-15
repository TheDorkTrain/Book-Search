const { User, Book} = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      return await User.findById(context.user._id).populate('books');
    },

    book: async (parent, { bookId }) => {
      return await Book.findById(bookId).populate('abilities').populate('skills').populate('savingThrows').populate('spells').populate('items').populate('journal');
    },
    
    books: async () => {
      return await Book.find();
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

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, { bookId, name, description }, context) => {
      if (context.user) {
        return await Book.findOneAndUpdate(
          { _id: bookId },
          { $addToSet: { books: { name, description } } },
          { new: true }
        ).populate('books');
      }
      throw AuthenticationError;
    },

  },
};

module.exports = resolvers;
