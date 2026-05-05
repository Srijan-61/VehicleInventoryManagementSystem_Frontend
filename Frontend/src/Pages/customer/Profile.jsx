import React from 'react';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

const Profile = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <form className="space-y-4">
        <InputField label="Name" value="Alice Johnson" />
        <InputField label="Email" value="alice@example.com" type="email" />
        <InputField label="Phone" value="+1 234 567 890" />
        <Button className="mt-4">Update Profile</Button>
      </form>
    </div>
  );
};

export default Profile;
