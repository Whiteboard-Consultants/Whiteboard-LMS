import React from 'react';
import {
  Document,
  Page,
  Image,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

// You can register custom fonts here if needed
// Font.register({ family: 'YourFont', src: '/path/to/font.ttf' });

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    // Use flexbox for easy positioning
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentName: {
    position: 'absolute',
    top: 180, // moved up to avoid overlap
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 30, // slightly smaller for long names
    fontWeight: 'bold',
    color: '#222',
  },
  courseTitle: {
    position: 'absolute',
    top: 260, // moved up to avoid overlap
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 26, // slightly smaller
    color: '#333',
  },
  date: {
    position: 'absolute',
    bottom: 120, // adjust as needed
    left: 80,
    fontSize: 18,
    color: '#444',
  },
  instructor: {
    position: 'absolute',
    bottom: 120, // adjust as needed
    right: 80,
    fontSize: 18,
    color: '#444',
    textAlign: 'right',
  },
});

interface CertificatePDFProps {
  studentName: string;
  courseTitle: string;
  date: string;
  instructorName: string;
}

const CertificatePDF: React.FC<CertificatePDFProps> = ({ studentName, courseTitle, date, instructorName }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Background image */}
  <Image src="public/certificate.png" style={styles.background} />
      {/* Overlay text */}
      <View style={styles.overlay}>
        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.courseTitle}>{courseTitle}</Text>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.instructor}>{instructorName}</Text>
      </View>
    </Page>
  </Document>
);

export default CertificatePDF;
