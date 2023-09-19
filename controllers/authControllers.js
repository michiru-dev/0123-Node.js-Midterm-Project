import path from 'path';
import { readWriteFile, writeToFile } from '../helpers/utils.js';
import { uuid } from '../helpers/users.js';
const filePath = path.join(path.resolve(), '/models/users.json');

export const registeredNewUsers = (req, res) => {
  const { name, email, password } = req.body;
  // Basic validation
  if (!name || !email || !password) {
    res.render('register', {
      errorMessage: 'Please fill in all fields',
      name: '', // 追加
    });
  } else {
    readWriteFile(filePath, (err, jsonData) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (!jsonData) {
        jsonData = {};
      }

      // set Duplicate

      const existedUsers = Object.values(jsonData);

      let setDuplicate = false;

      function findDuplicateEmail(data, i) {
        existedUsers.forEach((key, index) => {
          if (i !== index && key.email === email) {
            setDuplicate = true;
          }
        });
      }

      existedUsers.forEach((key, index) => {
        findDuplicateEmail(key, index);
      });

      if (setDuplicate) {
        res.render('register', {
          errorMessage: 'Email already exists',
          name: '', // 追加
        });
      } else {
        // Create a new user with a UUID (Replace this with database logic)
        const newUser = {
          [uuid]: {
            id: uuid,
            name,
            email,
            password,
          },
        };

        console.log('newUser: ', newUser);

        Object.assign(jsonData, newUser);

        writeToFile(filePath, jsonData, (err) => {
          if (err) {
            return res.status(500).json(err);
          }

          req.session.regenerate((err) => {
            if (err) {
              return next(err);
            }
            // const addUsers = Object.values(jsonData);

            // console.log('addUsers: ', addUsers);

            req.session.user = newUser[uuid].id;
            req.session.name = newUser[uuid].name;

            console.log('get session user', req.session.user);

            req.session.save((err) => {
              if (err) {
                return next(err);
              }
              console.log('save: ', req.session.user);
              res.redirect('/urls');
            });
          });
        });
      }
    });
  }
};
