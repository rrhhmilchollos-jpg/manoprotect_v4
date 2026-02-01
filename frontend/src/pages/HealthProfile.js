import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const HealthProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const API = process.env.REACT_APP_BACKEND_URL;
  
  const [profile, setProfile] = useState({
    blood_type: '',
    allergies: [],
    chronic_conditions: [],
    medications: [],
    emergency_medical_notes: '',
    doctor_name: '',
    doctor_phone: '',
    hospital_preference: '',
    organ_donor: null,
    height_cm: '',
    weight_kg: '',
    date_of_birth: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/health/profile`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfile({
          blood_type: data.blood_type || '',
          allergies: data.allergies || [],
          chronic_conditions: data.chronic_conditions || [],
          medications: data.medications || [],
          emergency_medical_notes: data.emergency_medical_notes || '',
          doctor_name: data.doctor_name || '',
          doctor_phone: data.doctor_phone || '',
          hospital_preference: data.hospital_preference || '',
          organ_donor: data.organ_donor,
          height_cm: data.height_cm || '',
          weight_kg: data.weight_kg || '',
          date_of_birth: data.date_of_birth || ''
        });
      }
    } catch (error) {
      console.error('Error fetching health profile:', error);
    }
    setLoading(false);
  }, [API]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API}/api/health/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...profile,
          height_cm: profile.height_cm ? parseInt(profile.height_cm) : null,
          weight_kg: profile.weight_kg ? parseInt(profile.weight_kg) : null
        })
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving health profile:', error);
    }
    setSaving(false);
  };

  const addItem = (field, value, setValue) => {
    if (value.trim()) {
      setProfile(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const removeItem = (field, index) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Perfil de Salud</h1>
          <p className="text-gray-600 mt-1">Información médica para emergencias</p>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm text-amber-700">
              Esta información puede ser compartida con servicios de emergencia cuando actives el SOS.
            </p>
          </div>
        </div>

        {/* Blood Type & Basic Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Información Básica
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Blood Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Sanguíneo</label>
              <select
                value={profile.blood_type}
                onChange={(e) => setProfile({...profile, blood_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccionar...</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                value={profile.date_of_birth}
                onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
              <input
                type="number"
                value={profile.height_cm}
                onChange={(e) => setProfile({...profile, height_cm: e.target.value})}
                placeholder="170"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                value={profile.weight_kg}
                onChange={(e) => setProfile({...profile, weight_kg: e.target.value})}
                placeholder="70"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Organ Donor */}
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Donante de Órganos</span>
            <div className="flex gap-2">
              <button
                onClick={() => setProfile({...profile, organ_donor: true})}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  profile.organ_donor === true 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Sí
              </button>
              <button
                onClick={() => setProfile({...profile, organ_donor: false})}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  profile.organ_donor === false 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Alergias
          </h2>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('allergies', newAllergy, setNewAllergy)}
              placeholder="Ej: Penicilina, Mariscos, Polen..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={() => addItem('allergies', newAllergy, setNewAllergy)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Añadir
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {profile.allergies.map((allergy, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
                {allergy}
                <button onClick={() => removeItem('allergies', index)} className="ml-2 text-orange-600 hover:text-orange-800">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
            {profile.allergies.length === 0 && (
              <span className="text-gray-400 text-sm">No hay alergias registradas</span>
            )}
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Condiciones Crónicas
          </h2>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('chronic_conditions', newCondition, setNewCondition)}
              placeholder="Ej: Diabetes, Hipertensión, Asma..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={() => addItem('chronic_conditions', newCondition, setNewCondition)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Añadir
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {profile.chronic_conditions.map((condition, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                {condition}
                <button onClick={() => removeItem('chronic_conditions', index)} className="ml-2 text-purple-600 hover:text-purple-800">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
            {profile.chronic_conditions.length === 0 && (
              <span className="text-gray-400 text-sm">No hay condiciones registradas</span>
            )}
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Medicamentos Actuales
          </h2>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('medications', newMedication, setNewMedication)}
              placeholder="Ej: Metformina 500mg, Enalapril 10mg..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={() => addItem('medications', newMedication, setNewMedication)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Añadir
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {profile.medications.map((medication, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {medication}
                <button onClick={() => removeItem('medications', index)} className="ml-2 text-blue-600 hover:text-blue-800">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
            {profile.medications.length === 0 && (
              <span className="text-gray-400 text-sm">No hay medicamentos registrados</span>
            )}
          </div>
        </div>

        {/* Doctor Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información Médica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Médico</label>
              <input
                type="text"
                value={profile.doctor_name}
                onChange={(e) => setProfile({...profile, doctor_name: e.target.value})}
                placeholder="Dr. García López"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono del Médico</label>
              <input
                type="tel"
                value={profile.doctor_phone}
                onChange={(e) => setProfile({...profile, doctor_phone: e.target.value})}
                placeholder="+34 600 000 000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Preferido</label>
              <input
                type="text"
                value={profile.hospital_preference}
                onChange={(e) => setProfile({...profile, hospital_preference: e.target.value})}
                placeholder="Hospital Universitario..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Emergency Notes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Notas de Emergencia
          </h2>
          
          <textarea
            value={profile.emergency_medical_notes}
            onChange={(e) => setProfile({...profile, emergency_medical_notes: e.target.value})}
            placeholder="Información adicional importante para emergencias médicas..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
            saving 
              ? 'bg-gray-400 cursor-not-allowed' 
              : saved 
                ? 'bg-green-500' 
                : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {saving ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : saved ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ¡Guardado!
            </span>
          ) : (
            'Guardar Perfil de Salud'
          )}
        </button>

        {/* Info Footer */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Esta información se compartirá con servicios de emergencia cuando actives el SOS
        </p>
      </div>
    </div>
  );
};

export default HealthProfile;
