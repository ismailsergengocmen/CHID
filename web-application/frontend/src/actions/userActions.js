import backendClient from '../config/axiosConfig';
import { USER_INFO_FETCH, USER_INFO_REMOVE } from '../constants';

export const fetchCurrentUser = () => async (dispatch) => {
	try {
		const { data } = await backendClient.get('/api/auth/user');
		dispatch({ type: USER_INFO_FETCH, payload: data });

		if (data) {
			localStorage.setItem(
				'userInfo',
				JSON.stringify({
					user_name: data.user_name,
					github_id: data.user_github_id,
				})
			);
		}
	} catch (error) {
		console.log(error);
	}
};

export const removeCurrentUser = () => (dispatch) => {
	dispatch({ type: USER_INFO_REMOVE });
	localStorage.removeItem('userInfo');
};
