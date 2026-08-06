import { useEffect, useState } from 'react';
import { Image, ScrollView, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LayoutDirection } from 'uniwind';

import { AppText, textSizeClass } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Phrase } from '@/data/models';
import { phraseRepository } from '@/data/repositories';
import { useSettings } from '@/hooks/useSettings';
import { usePhraseStore } from '@/store/phraseStore';
import { useAppColors } from '@/theme/useAppColors';

const MY_WORDS_CATEGORY_ID = 'my-words';

/** Copy a picked photo out of the picker cache into permanent app storage. */
function persistPhoto(pickedUri: string): string {
  const destination = new File(Paths.document, `phrase-photo-${randomUUID()}.jpg`);
  new File(pickedUri).copy(destination);
  return destination.uri;
}

function deletePhotoQuietly(uri?: string) {
  if (!uri) return;
  try {
    new File(uri).delete();
  } catch {
    // Missing file is fine — nothing to clean up.
  }
}

export default function EditPhraseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useAppColors();
  const { textScale } = useSettings();

  const createPhrase = usePhraseStore((s) => s.createPhrase);
  const updatePhrase = usePhraseStore((s) => s.updatePhrase);
  const deletePhrase = usePhraseStore((s) => s.deletePhrase);

  const [original, setOriginal] = useState<Phrase | null>(null);
  const [textEn, setTextEn] = useState('');
  const [textAr, setTextAr] = useState('');
  const [photoUri, setPhotoUri] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    phraseRepository.getPhrase(id).then((phrase) => {
      if (phrase) {
        setOriginal(phrase);
        setTextEn(phrase.text.en);
        setTextAr(phrase.text.ar);
        setPhotoUri(phrase.photoUri);
      }
    });
  }, [id]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const canSave = textEn.trim().length > 0 && textAr.trim().length > 0 && !saving;

  const handleSave = async () => {
    setSaving(true);
    // Photos are only copied into permanent storage on save, so a
    // cancelled edit never leaves orphaned files behind.
    let savedPhotoUri = photoUri;
    if (photoUri && photoUri !== original?.photoUri) {
      savedPhotoUri = persistPhoto(photoUri);
    }
    if (original?.photoUri && original.photoUri !== savedPhotoUri) {
      deletePhotoQuietly(original.photoUri);
    }

    const input = {
      categoryId: MY_WORDS_CATEGORY_ID,
      text: { en: textEn.trim(), ar: textAr.trim() },
      photoUri: savedPhotoUri,
    };
    if (original) {
      await updatePhrase(original.id, input);
    } else {
      await createPhrase(input);
    }
    router.back();
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    if (original) {
      deletePhotoQuietly(original.photoUri);
      await deletePhrase(original);
    }
    router.back();
  };

  const inputClassName = `min-h-16 rounded-control border-2 border-border bg-surface p-4 font-tajawal ${textSizeClass('md', textScale)} text-foreground high-contrast:border-[3px]`;

  return (
    <Screen>
      <ScreenHeader title={id ? t('editPhrase.titleEdit') : t('editPhrase.titleNew')} />
      <ScrollView
        contentContainerClassName="gap-4 p-4"
        keyboardShouldPersistTaps="handled"
      >
        <AppText weight="medium">{t('editPhrase.textEn')}</AppText>
        <LayoutDirection rtl={false}>
          <TextInput
            value={textEn}
            onChangeText={setTextEn}
            accessibilityLabel={t('editPhrase.textEn')}
            className={`${inputClassName} text-left`}
          />
        </LayoutDirection>

        <AppText weight="medium">{t('editPhrase.textAr')}</AppText>
        <LayoutDirection rtl>
          <TextInput
            value={textAr}
            onChangeText={setTextAr}
            accessibilityLabel={t('editPhrase.textAr')}
            className={`${inputClassName} text-right`}
          />
        </LayoutDirection>

        <AppText size="sm" muted>
          {t('editPhrase.required')}
        </AppText>

        <AppText weight="medium">{t('editPhrase.photo')}</AppText>
        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            className="h-30 w-30 self-start rounded-control"
            resizeMode="cover"
            accessibilityLabel={t('a11y.photoOfPhrase')}
          />
        )}
        <View className="flex-row gap-3">
          <BigButton
            onPress={pickPhoto}
            accessibilityLabel={photoUri ? t('editPhrase.changePhoto') : t('editPhrase.addPhoto')}
            minSize={64}
            className="flex-1 flex-row gap-2 px-3"
          >
            <MaterialCommunityIcons name="image-plus" size={26} color={colors.primary} />
            <AppText weight="medium">
              {photoUri ? t('editPhrase.changePhoto') : t('editPhrase.addPhoto')}
            </AppText>
          </BigButton>
          {photoUri && (
            <BigButton
              onPress={() => setPhotoUri(undefined)}
              accessibilityLabel={t('editPhrase.removePhoto')}
              minSize={64}
              className="px-3"
            >
              <AppText weight="medium" tone="danger">
                {t('editPhrase.removePhoto')}
              </AppText>
            </BigButton>
          )}
        </View>

        <BigButton
          onPress={handleSave}
          accessibilityLabel={t('common.save')}
          disabled={!canSave}
          tone="primary"
          className="p-3"
        >
          <AppText size="lg" weight="bold" tone="onPrimary">
            {t('common.save')}
          </AppText>
        </BigButton>

        {original && (
          <BigButton
            onPress={() => setConfirmDelete(true)}
            accessibilityLabel={t('editPhrase.deletePhrase')}
            tone="dangerOutline"
            minSize={64}
            className="px-4"
          >
            <AppText weight="bold" tone="danger">
              {t('editPhrase.deletePhrase')}
            </AppText>
          </BigButton>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirmDelete}
        title={t('editPhrase.deleteConfirmTitle')}
        body={t('editPhrase.deleteConfirmBody')}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}
