import App from '@/app'
import AuthRoute from '@/routes/auth.route'
import HolidayRoute from './routes/holiday.route'

const app = new App([new AuthRoute(), new HolidayRoute()])

app.listen()