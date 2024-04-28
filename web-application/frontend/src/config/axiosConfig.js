import axios from 'axios';

const baseURL =
	process.env.REACT_APP_ENV === 'development'
		? 'http://localhost:6002'
		: 'http://real_backend_domain';

const backendClient = axios.create({ baseURL, withCredentials: true });

export default backendClient;
