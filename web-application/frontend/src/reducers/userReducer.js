import { USER_INFO_FETCH, USER_INFO_REMOVE } from '../constants';

export const userInfoReducer = (state = {}, action) => {
	switch (action.type) {
		case USER_INFO_FETCH:
			return { user: action.payload };
		case USER_INFO_REMOVE:
			return { user: {} };
		default:
			return state;
	}
};
