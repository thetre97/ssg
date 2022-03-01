// Commands:
// - develop
// - build
// - explore (opens browser?)
import { program, command } from 'bandersnatch'

const foo = command('foo')
  .description('Outputs "bar".')
  .action(() => console.log('bar'))

const cmd = command('address')
  .argument('address', {
    prompt: 'Your address'
  })
  .option('name', {
    description: 'Your name',
    default: 'anonymous',
    prompt: true
  })
  .option('size', {
    description: 'Choose pizza size',
    choices: ['small', 'medium', 'large'],
    default: 'medium',
    prompt: true
  })
  .option('toppings', {
    description: 'Pick some toppings',
    choices: ['mozzarella', 'pepperoni', 'veggies'],
    default: ['mozzarella'],
    prompt: true
  })
  .option('confirmed', {
    description: 'Order pizza?',
    default: true,
    prompt: true
  })
  .action((args) => {
    console.log(args)
  })

export default program()
  .description('SSG CLI')
  .add(foo)
  .add(cmd)
  .run()
  .catch((err) => {
    console.error(`There was a problem running this command:\n${String(err)}`)
    process.exit(1)
  })
