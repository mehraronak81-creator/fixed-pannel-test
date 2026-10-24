import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import { UserCircleIcon, KeyIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import { Button } from '@/components/elements/button/index';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';
import { useTranslation } from 'react-i18next';

interface Values {
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const { t } = useTranslation('vantablack/auth');
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');
    const [eyeOpen, setEyeOpen] = useState(false);
    // Tracks whether the invisible reCAPTCHA widget has actually loaded. If the
    // Google script is blocked, slow, or the site key is invalid, this stays
    // false and we fall back to submitting without a captcha token so the user
    // is never stuck on a login form that silently refuses to do anything.
    const [captchaReady, setCaptchaReady] = useState(false);
    const [captchaFailed, setCaptchaFailed] = useState(false);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    // A misconfigured/empty site key can never produce a valid token, so treat
    // the captcha as effectively unavailable and let the request go through
    // (the backend still validates and will reject if it truly requires one).
    const captchaUsable = recaptchaEnabled && !!siteKey && !captchaFailed;

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (captchaUsable && !token) {
            if (!captchaReady || !ref.current) {
                // The widget never finished loading — do not trap the user.
                // Submit without a token; the server decides whether that is allowed.
                login({ ...values, recaptchaData: token })
                    .then((response) => {
                        if (response.complete) {
                            // @ts-expect-error this is valid
                            window.location = response.intended || '/';
                            return;
                        }
                        history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
                    })
                    .catch((error) => {
                        console.error(error);
                        setToken('');
                        setSubmitting(false);
                        clearAndAddHttpError({ error });
                    });
                return;
            }

            ref.current.execute().catch((error) => {
                console.error(error);

                // Executing the challenge failed (network/script issue). Rather
                // than leaving the button spinning forever, mark the captcha as
                // failed so a retry submits without it.
                setCaptchaFailed(true);
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            })
            .catch((error) => {
                console.error(error);

                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required(t('login.must-be-provided')),
                password: string().required(t('login.please-enter-password')),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={t('login.title')} css={tw`w-full flex`}>
                    <Field type={'text'} label={t('login.username-or-email')} placeholder={t('login.username-or-email')} name={'username'} disabled={isSubmitting} icon={UserCircleIcon}/>
                    <div css={tw`mt-6`}>
                        <div className={'flex justify-between'}>
                            <label className={'block text-sm text-gray-300 mb-1 sm:mb-2 font-light'}>{t('login.password')}</label>
                            <Link
                                to={'/auth/password'}
                                css={tw`text-sm text-neutral-300 tracking-wide underline hover:text-neutral-200 font-light`}
                            >
                                {t('login.forgot-password')}
                            </Link>
                        </div>
                        <div className={'relative'}>
                            <Field type={eyeOpen ? 'text' : 'password'} placeholder={t('login.password')} name={'password'} disabled={isSubmitting} icon={KeyIcon} />
                            <button type={'button'} className={'absolute top-2 right-2 p-1 text-gray-300'} onClick={() => setEyeOpen(!eyeOpen)}>
                                {eyeOpen 
                                ? <EyeOffIcon className={'w-5'} />
                                : <EyeIcon className={'w-5'} />}
                            </button>
                        </div>
                    </div>
                    <div css={tw`mt-6`}>
                        <Button type={'submit'} className={'w-full !py-3'} disabled={isSubmitting}>
                            {t('login.login')}
                        </Button>
                    </div>
                    <div className={'z-50 relative'}>
                        {recaptchaEnabled && !!siteKey && !captchaFailed && (
                            <Reaptcha
                                ref={ref}
                                size={'invisible'}
                                sitekey={siteKey}
                                onLoad={() => setCaptchaReady(true)}
                                onVerify={(response) => {
                                    setToken(response);
                                    submitForm();
                                }}
                                onError={() => {
                                    // Google widget errored out (e.g. script blocked,
                                    // key/domain mismatch). Stop blocking the user.
                                    setCaptchaFailed(true);
                                    setSubmitting(false);
                                    setToken('');
                                }}
                                onExpire={() => {
                                    setSubmitting(false);
                                    setToken('');
                                    if (ref.current) ref.current.reset();
                                }}
                            />
                        )}
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
