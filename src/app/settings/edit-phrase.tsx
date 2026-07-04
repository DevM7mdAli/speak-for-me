import { useEffect, useState } from 'react';
import { I18nManager, ScrollView, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Phrase } from '@/data/models';
import { phraseRepository } from '@/data/repositories';
import { usePhraseStore } from '@/store/phraseStore';
import { fontFamily, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

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
  const { colors, bw, fs } = useTheme();

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

  const inputStyle = {
    minHeight: 64,
    borderWidth: bw,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: fs('md'),
    padding: spacing.lg,
  } as const;

  return (
    <Screen>
      <ScreenHeader title={id ? t('editPhrase.titleEdit') : t('editPhrase.titleNew')} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <AppText weight="medium">{t('editPhrase.textEn')}</AppText>
        <TextInput
          value={textEn}
          onChangeText={setTextEn}
          accessibilityLabel={t('editPhrase.textEn')}
          style={[inputStyle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}
        />

        <AppText weight="medium">{t('editPhrase.textAr')}</AppText>
        <TextInput
          value={textAr}
          onChangeText={setTextAr}
          accessibilityLabel={t('editPhrase.textAr')}
          style={[inputStyle, { textAlign: 'right', writingDirection: 'rtl' }]}
        />

        <AppText size="sm" muted>
          {t('editPhrase.required')}
        </AppText>

        <AppText weight="medium">{t('editPhrase.photo')}</AppText>
        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={{ width: 120, height: 120, borderRadius: radius.md, alignSelf: 'flex-start' }}
            contentFit="cover"
            accessibilityLabel={t('a11y.photoOfPhrase')}
          />
        )}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <BigButton
            onPress={pickPhoto}
            accessibilityLabel={photoUri ? t('editPhrase.changePhoto') : t('editPhrase.addPhoto')}
            minSize={64}
            style={{ flex: 1, flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md }}
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
              style={{ paddingHorizontal: spacing.md }}
            >
              <AppText weight="medium" color={colors.danger}>
                {t('editPhrase.removePhoto')}
              </AppText>
            </BigButton>
          )}
        </View>

        <BigButton
          onPress={handleSave}
          accessibilityLabel={t('common.save')}
          disabled={!canSave}
          color={colors.primary}
          pressedColor={colors.primaryPressed}
          style={{ padding: spacing.md }}
        >
          <AppText size="lg" weight="bold" color={colors.onPrimary}>
            {t('common.save')}
          </AppText>
        </BigButton>

        {original && (
          <BigButton
            onPress={() => setConfirmDelete(true)}
            accessibilityLabel={t('editPhrase.deletePhrase')}
            borderColor={colors.danger}
            minSize={64}
            style={{ paddingHorizontal: spacing.lg }}
          >
            <AppText weight="bold" color={colors.danger}>
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
