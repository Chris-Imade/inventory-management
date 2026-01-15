const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const { config, validateEnv } = require('./src/config');
const { connectDatabase } = require('./src/database/connection');
const { errorHandler } = require('./src/utils/errorHandler');
const apiRoutes = require('./src/routes');

validateEnv();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: false,
}));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session(config.session));

app.use(express.static(path.join(__dirname, 'public')));

const webController = require('./src/controllers/webController');
const { isAuthenticated } = require('./src/middleware/auth');

app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { appName: config.appName });
});

app.get('/dashboard', isAuthenticated, webController.renderDashboard);
app.get('/inventory', isAuthenticated, webController.renderInventory);
app.get('/pos', isAuthenticated, webController.renderPOS);
app.get('/transactions', isAuthenticated, webController.renderTransactions);
app.get('/alerts', isAuthenticated, webController.renderAlerts);
app.get('/reports', isAuthenticated, webController.renderReports);
app.get('/billing/cards', isAuthenticated, webController.renderBillingCards);
app.get('/billing/consultation', isAuthenticated, webController.renderBillingConsultation);
app.get('/billing/drugs', isAuthenticated, webController.renderBillingDrugs);
app.get('/billing/procedure', isAuthenticated, webController.renderBillingProcedure);
app.get('/billing/admission', isAuthenticated, webController.renderBillingAdmission);

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🏥 ${config.appName}`);
      console.log('='.repeat(50));
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${config.env}`);
      console.log(`✓ Database: Connected`);
      console.log(`✓ URL: http://localhost:${PORT}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
