import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../store/languageSlice';
import translations from '../i18n/translations';

const useTranslation = () => {
    const dispatch = useDispatch();
    const { lang } = useSelector((state) => state.language);

    // Fallback to EN if lang is not found (though it should be initialized correctly)
    const t = translations[lang] || translations['EN'];

    const changeLanguage = (newLang) => {
        dispatch(setLanguage(newLang));
    };

    return { t, lang, changeLanguage };
};

export default useTranslation;
