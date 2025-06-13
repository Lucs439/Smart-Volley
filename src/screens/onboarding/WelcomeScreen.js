import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Button from '../../components/common/Button';
import { colors } from '../../styles/colors';

// Import de tes SVG
import Logo from '../../assets/illustrations/logo.svg';
import Illustration1 from '../../assets/illustrations/illustration1.svg';

export default function WelcomeScreen({ navigation }) {
  const handleGetStarted = () => {
    // Plus tard on naviguera vers le prochain écran
    console.log('Création de compte');
  };

  const handleLogin = () => {
    // Plus tard on naviguera vers la connexion
    console.log('Connexion');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Ton logo SVG */}
        <View style={styles.logoContainer}>
          <Logo width={80} height={80} />
        </View>

        {/* Titre principal */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Paww</Text>
          <Text style={styles.subtitle}>
            L'amour, ça se{'\n'}suit de près !
          </Text>
        </View>

        {/* Ton illustration SVG */}
        <View style={styles.illustrationContainer}>
          <Illustration1 
            width={280} 
            height={200}
          />
        </View>

        {/* Boutons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Création de mon compte"
            onPress={handleGetStarted}
            style={styles.primaryButton}
          />
          
          <TouchableOpacity onPress={handleLogin} style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Vous avez déjà un compte ? 
              <Text style={styles.loginLink}> Inscription</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    marginBottom: 24,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '600',
  },
}); 