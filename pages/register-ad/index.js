import React, { useState } from "react";
import RegisterPointMap from "../../components/common/Map/RegisterPointMap";
import RegisterAdForm from "../../components/register-ad/RegisterAdForm";
import {
  AD_LOST_TYPE_ID,
  AD_FOUND_TYPE_ID,
} from "../../components/register-ad/ChooseTypeAd";
import { connect } from "react-redux";
import { actions } from "../../store";
import API from "../../utils/API";
import InfoModal from "../../components/common/InfoModal";
import Router from "next/router";

const infoModalTextNotRegisterUser = `Your ad will be published after verification by us, we will notify you by email about this.
Also, you are already registered, your password was generated automaticly and sent to your email.
You can edit or delete your ad in user accout.
`;

const infoModalTextRegisteredUser = `Your ad will be published after verification by us, we will notify you by email about this.
You can edit or delete your ad in user accout.
`;

const RegisterAd = ({ adsCategories, userData, login }) => {
  const [typeAd, setTypeAd] = useState(AD_LOST_TYPE_ID);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [point, setPoint] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState("");
  const [secretQuestion, setSecretQuestion] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [lostOrFoundAt, setLostOrFoundAt] = useState(new Date());
  const [userInfo, setUserInfo] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
  });
  const [errMessage, setErrMessage] = useState("");

  const [isLoadSubmitForm, setLoadSubmitForm] = useState(false);
  const [infoModal, setInfoModal] = useState(null);

  const onSubmitRegisterAdForm = (event) => {
    if (!typeAd) {
      setErrMessage("Type ad is undefined");
      return;
    }
    if (!title.length) {
      setErrMessage("Enter title of your Ad");
      return;
    }
    if (title.length < 5 || title.length > 50) {
      setErrMessage(
        "The title must consist of at least 5 and no more than 40 characters"
      );
      return;
    }

    if (!description.length) {
      setErrMessage("Enter description of your Ad");
      return;
    }

    if (description.length < 10) {
      setErrMessage("The description must consist of at least 10 characters");
      return;
    }

    if (!categoryId) {
      setErrMessage("Choose category");
      return;
    }
    if (!point.lat || !point.lng) {
      setErrMessage("Choose point on the map");
      return;
    }
    if (!address.length) {
      setErrMessage(
        `Enter address where you ${
          typeAd === AD_FOUND_TYPE_ID ? "found" : "lost"
        } it`
      );
      return;
    }
    if (address.length < 10) {
      setErrMessage(`The address must consist of at least 10 characters`);
      return;
    }
    if (secretQuestion && !secretAnswer.length) {
      setErrMessage(`Enter secret answer on your secret question`);
      return;
    }

    const adFormData = new FormData();
    adFormData.append("title", title);
    adFormData.append("description", description);

    adFormData.append("typeId", typeAd);
    adFormData.append("categoryId", categoryId);

    adFormData.append("location[address]", address);
    adFormData.append("location[lat]", point.lat);
    adFormData.append("location[lng]", point.lng);
    if (userData) {
      adFormData.append("user[firstname]", userData.firstname);
      adFormData.append("user[lastname]", userData.lastname);
      adFormData.append("user[email]", userData.email);
      adFormData.append("user[phone]", userData.phone);
    } else {
      adFormData.append("user[firstname]", userInfo.firstname);
      adFormData.append("user[lastname]", userInfo.lastname);
      adFormData.append("user[email]", userInfo.email);
      adFormData.append("user[phone]", userInfo.phone);
    }
    if (lostOrFoundAt) {
      adFormData.append("lostOrFoundAt", lostOrFoundAt.toISOString());
    }
    if (
      secretQuestion &&
      secretQuestion.length &&
      secretAnswer &&
      secretAnswer.length
    ) {
      adFormData.append("secretQuestion", secretQuestion);
      adFormData.append("secretAnswer", secretAnswer);
    }

    if (event.target.mainPhoto.files[0]) {
      adFormData.append("photos", event.target.mainPhoto.files[0]);
    }
    if (event.target.subPhotoOne.files[0]) {
      adFormData.append("photos", event.target.subPhotoOne.files[0]);
    }
    if (event.target.subPhotoTwo.files[0]) {
      adFormData.append("photos", event.target.subPhotoTwo.files[0]);
    }

    setLoadSubmitForm(true);
    API.post("/ads", adFormData)
      .then((resp) => {
        setLoadSubmitForm(false);
        login(resp.data.user, resp.data.token);
        if (!userData) {
          setInfoModal(infoModalTextNotRegisterUser);
        } else {
          setInfoModal(infoModalTextRegisteredUser);
        }
      })
      .catch((err) => {
        setLoadSubmitForm(false);
      });
  };

  const onChangeUserInfo = (e) => {
    setErrMessage("");
    setUserInfo({
      ...userInfo,
      [e.target.name]: [e.target.value],
    });
  };

  const onChangePhoneNumber = (phone) => {
    setErrMessage("");
    setUserInfo({
      ...userInfo,
      phone,
    });
  };

  const onCloseInfoModal = () => {
    Router.push("/account");
    setInfoModal(null);
  };

  return (
    <div className="wrap-register-ad-page">
      <RegisterPointMap
        point={point}
        setErrMessage={setErrMessage}
        setPoint={setPoint}
        setAddress={setAddress}
        typeAd={typeAd}
      />
      <RegisterAdForm
        onSubmitForm={onSubmitRegisterAdForm}
        userData={userData}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        secretQuestion={secretQuestion}
        setSecretQuestion={setSecretQuestion}
        secretAnswer={secretAnswer}
        setSecretAnswer={setSecretAnswer}
        userInfo={userInfo}
        onChangePhoneNumber={onChangePhoneNumber}
        onChangeUserInfo={onChangeUserInfo}
        address={address}
        setAddress={setAddress}
        typeAd={typeAd}
        setTypeAd={setTypeAd}
        categoryOptions={adsCategories}
        categoryId={categoryId}
        onChooseCategory={setCategoryId}
        lostOrFoundAt={lostOrFoundAt}
        setLostOrFoundAt={setLostOrFoundAt}
        errMessage={errMessage}
        setErrMessage={setErrMessage}
        isLoadSubmitForm={isLoadSubmitForm}
        point={point}
      />
      <InfoModal
        onClose={onCloseInfoModal}
        headerText="Thank you for your Ad!"
        infoText={infoModal}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  adsCategories: state.app.adsCategories,
  userData: state.app.userData,
});

const mapDispatchToProps = (dispatch) => ({
  login: (userData, token) => dispatch(actions.app.login(userData, token)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterAd);
